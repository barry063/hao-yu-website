/** Timer-independent watcher state machine. Dependencies are injected for tests. */
import {digest} from './workflow-core.mjs';
export function londonDate(now = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/London', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(new Date(now));
  const get = type => parts.find(p => p.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export class WatcherEngine {
  constructor({read, prepare, validateReady, notify, save, state = {}, now = Date.now, settleMs = 10000, retryMs = 120000, maxFailures = 3}) {
    Object.assign(this, {read, prepare, validateReady, notify, save, now, settleMs, retryMs, maxFailures});
    this.state = {version:1, processed:null, pending:null, attempts:0, ...state};
    this.observation = null; this.busy = false;
  }
  persist() { this.save(this.state); }
  action(status, identity, extra = {}) {
    this.state.status = status; Object.assign(this.state, extra);
    const key = digest({status, identity});
    if (key !== this.state.notice?.key) this.state.notice = {key, kind:status === 'READY_FOR_REVIEW' ? 'READY' : 'PROBLEM', attempts:0, delivered:false};
    this.persist();
  }
  async deliver() {
    const notice = this.state.notice;
    if (!notice || notice.delivered || notice.attempts >= 3) return;
    notice.attempts++; this.persist();
    try { notice.receipt = await this.notify(notice); notice.delivered = true; }
    catch { notice.delivery = 'FAILED_USE_STATUS'; }
    this.persist();
  }
  async tick() {
    if (this.busy) return; this.busy = true;
    try {
      let snapshot;
      try { snapshot = this.read(); }
      catch {
        this.observation = null; this.state.readFailures = (this.state.readFailures || 0) + 1;
        if (this.state.pending) {
          this.state.superseded = this.state.pending; this.state.pending = null;
          // A ready package needs fresh validation after source access recovers.
          this.state.processed = null;
        }
        this.state.status = 'RETRYING_SOURCE_READ';
        if (this.state.readFailures >= 3) this.action('SOURCE_UNAVAILABLE', 'read'); else this.persist();
        await this.deliver(); return;
      }
      this.state.readFailures = 0;
      const {sources, bindings, approvedBindings} = snapshot;
      if (bindings !== approvedBindings) {
        if (this.state.pending) { this.state.superseded = this.state.pending; this.state.pending = null; }
        this.observation = null; this.action('REVALIDATION_REQUIRED', bindings); await this.deliver(); return;
      }
      const fingerprint = digest({sources, bindings});
      if (this.state.pending && this.state.processed !== fingerprint) {
        this.state.superseded = this.state.pending; this.state.pending = null;
        this.action('STALE_PENDING_REVIEW', fingerprint);
      }
      if (fingerprint === this.state.processed) {
        if (this.state.status === 'RETRYING_SOURCE_READ' || this.state.status === 'SOURCE_UNAVAILABLE') {
          this.state.status = this.state.resultStatus || (this.state.pending ? 'READY_FOR_REVIEW' : 'NO_CHANGE');
          if (!this.state.pending && this.state.status === 'NO_CHANGE') this.state.notice = null;
          this.persist();
        }
        // Package tampering/deletion is also actionable, without rebuilding.
        if (this.state.pending) {
          try { this.validateReady(this.state.pending, snapshot); }
          catch { this.state.superseded = this.state.pending; this.state.pending = null; this.action('REVALIDATION_REQUIRED', 'package-' + fingerprint); }
        }
        await this.deliver(); return;
      }
      const time = this.now();
      if (!this.observation || this.observation.fingerprint !== fingerprint) {
        this.observation = {fingerprint, since:time}; this.state.status = 'SETTLING'; this.persist(); await this.deliver(); return;
      }
      if (time - this.observation.since < this.settleMs) return;
      if (this.state.attempt?.fingerprint !== fingerprint) this.state.attempt = {fingerprint, date:londonDate(time), count:0, next:0};
      const attempt = this.state.attempt;
      if (time < attempt.next) return;
      this.state.status = 'PREPARING'; this.persist();
      let result;
      try { result = await this.prepare(attempt.date); }
      catch (error) { result = {state:'FAILED', code:error.message === 'WORKFLOW_BUSY' ? 'WORKFLOW_BUSY' : 'PREPARATION_FAILED'}; }
      if (result.code === 'WORKFLOW_BUSY') { attempt.next = time + this.retryMs; this.persist(); return; }
      let latest;
      try { latest = this.read(); } catch { latest = null; }
      if (!latest || digest({sources:latest.sources, bindings:latest.bindings}) !== fingerprint || latest.bindings !== latest.approvedBindings) {
        this.observation = null; this.state.status = 'INPUTS_CHANGED_DURING_PREPARATION'; this.persist(); return;
      }
      attempt.count++;
      if (result.state === 'READY_FOR_REVIEW') {
        try { this.validateReady(result, latest); }
        catch { result = {state:'FAILED', code:'CANDIDATE_VALIDATION_FAILED'}; }
      }
      if (result.state === 'NO_CHANGE') {
        this.state.processed = fingerprint; this.state.pending = null; this.state.status = 'NO_CHANGE'; this.state.notice = null;
      } else if (result.state === 'READY_FOR_REVIEW') {
        this.state.processed = fingerprint; this.state.pending = {candidate:result.candidate, target:result.target};
        this.action(result.state, result.candidate);
      } else if (result.state === 'NEEDS_RECONCILIATION') {
        this.state.processed = fingerprint; this.action(result.state, fingerprint);
      } else {
        attempt.next = time + this.retryMs * 2 ** (attempt.count - 1);
        this.action('FAILED', fingerprint);
        if (attempt.count >= this.maxFailures) this.state.processed = fingerprint;
      }
      this.state.resultStatus = this.state.status;
      this.persist(); await this.deliver();
    } finally { this.busy = false; }
  }
}
