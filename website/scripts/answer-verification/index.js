/**
 * NV-1100-P6 — Deterministic Answer Verification
 *
 * Entry point. Wires the engine, storage, and controller; exposes them on
 * `window.NeuralVerse` so the rest of the platform (artifacts, agents,
 * search, settings) can integrate without a build step.
 */

import { VERIFICATION_ENGINE, verifyAnswer } from './verification-engine.js';
import { VERIFICATION_RULES, SUPPORTED_TYPES } from './verification-rules.js';
import { VerificationStorage } from './verification-storage.js';
import { createVerificationController } from './verification-controller.js';
import { VERIFICATION_UI } from './verification-ui.js';
import { ANSWER_NORMALIZER } from './answer-normalizer.js';

let _installed = false;

export function installAnswerVerification(options) {
  if (_installed && (!options || !options.force)) {
    return {
      verificationEngine: window.NeuralVerse?.verificationEngine,
      answerVerifier: window.NeuralVerse?.answerVerifier,
      verificationStorage: window.NeuralVerse?.verificationStorage,
      verificationController: window.NeuralVerse?.verificationController,
      verificationUI: window.NeuralVerse?.verificationUI,
      verificationRules: window.NeuralVerse?.verificationRules,
      answerNormalizer: window.NeuralVerse?.answerNormalizer
    };
  }
  const controller = createVerificationController();
  if (typeof window !== 'undefined') {
    window.NeuralVerse = window.NeuralVerse || {};
    window.NeuralVerse.verificationEngine = VERIFICATION_ENGINE;
    window.NeuralVerse.answerVerifier = verifyAnswer;
    window.NeuralVerse.verificationStorage = VerificationStorage;
    window.NeuralVerse.verificationController = controller;
    window.NeuralVerse.verificationUI = VERIFICATION_UI;
    window.NeuralVerse.verificationRules = VERIFICATION_RULES;
    window.NeuralVerse.answerNormalizer = ANSWER_NORMALIZER;
  }
  _installed = true;
  return {
    verificationEngine: VERIFICATION_ENGINE,
    answerVerifier: verifyAnswer,
    verificationStorage: VerificationStorage,
    verificationController: controller,
    verificationUI: VERIFICATION_UI,
    verificationRules: VERIFICATION_RULES,
    answerNormalizer: ANSWER_NORMALIZER
  };
}

export {
  verifyAnswer,
  SUPPORTED_TYPES,
  VERIFICATION_ENGINE,
  VERIFICATION_RULES,
  VerificationStorage,
  VERIFICATION_UI,
  ANSWER_NORMALIZER,
  createVerificationController
};

export default installAnswerVerification;
