/** Independent, observable BIP-M8 feature flags. Disabled by default. */
const DEFAULTS = Object.freeze({
  packageDelivery: false,
  learnerState: false,
  laboratorySubmission: false,
  assessmentSubmission: false,
  workflowProgress: false,
});

const names = Object.freeze({
  packageDelivery: 'bip_m8_package_delivery',
  learnerState: 'bip_m8_learner_state',
  laboratorySubmission: 'bip_m8_laboratory_submission',
  assessmentSubmission: 'bip_m8_assessment_submission',
  workflowProgress: 'bip_m8_workflow_progress',
});

export function createBipM8Flags(overrides = {}) {
  const values = { ...DEFAULTS, ...overrides };
  const flags = {
    names,
    isEnabled: (capability) => values[capability] === true,
    snapshot: () => Object.freeze({ ...values }),
    enable: (capability) => { if (capability in values) values[capability] = true; },
    disable: (capability) => { if (capability in values) values[capability] = false; },
  };
  return Object.freeze(flags);
}

export const bipM8Flags = createBipM8Flags(
  typeof globalThis !== 'undefined' && globalThis.NV_BIP_M8_FLAGS ? globalThis.NV_BIP_M8_FLAGS : {},
);
