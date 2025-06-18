import { innLegal } from 'ru-validation-codes';

export function isInnLegalValid(inn) {
  return innLegal(inn);
}