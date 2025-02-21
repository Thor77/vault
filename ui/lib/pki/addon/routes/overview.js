/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { withConfig } from 'pki/decorators/check-config';
import { hash } from 'rsvp';

export const PKI_DEFAULT_EMPTY_STATE_MSG =
  "This PKI mount hasn't yet been configured with a certificate issuer.";

export const getCliMessage = (msg) => {
  if (!msg) return PKI_DEFAULT_EMPTY_STATE_MSG;

  return `${PKI_DEFAULT_EMPTY_STATE_MSG} There are existing ${msg}. Use the CLI to perform any operations with them until an issuer is configured.`;
};

@withConfig()
export default class PkiOverviewRoute extends Route {
  @service secretMountPath;
  @service auth;
  @service store;

  async fetchAllCertificates() {
    try {
      return await this.store.query('pki/certificate/base', { backend: this.secretMountPath.currentPath });
    } catch (e) {
      return e.httpStatus;
    }
  }

  async fetchAllRoles() {
    try {
      return await this.store.query('pki/role', { backend: this.secretMountPath.currentPath });
    } catch (e) {
      return e.httpStatus;
    }
  }

  async fetchAllIssuers() {
    try {
      return await this.store.query('pki/issuer', { backend: this.secretMountPath.currentPath });
    } catch (e) {
      return e.httpStatus;
    }
  }

  async model() {
    return hash({
      hasConfig: this.shouldPromptConfig,
      engine: this.modelFor('application'),
      roles: this.fetchAllRoles(),
      issuers: this.fetchAllIssuers(),
      certificates: this.fetchAllCertificates(),
    });
  }

  setupController(controller, resolvedModel) {
    super.setupController(controller, resolvedModel);
    const roles = resolvedModel.roles;
    const certificates = resolvedModel.certificates;

    controller.message = getCliMessage();

    if (roles?.length) controller.message = getCliMessage('roles');
    if (certificates?.length) controller.message = getCliMessage('certificates');
    if (roles?.length && certificates?.length) controller.message = getCliMessage('roles and certificates');
  }
}
