import { Authentication, FixedUserRoles, RestPaths } from '@mt-hrm/common';
import { MetaLinkService } from '@mt-hrm/services';
import { parseMultipartBody } from '@lb/infra';
import { inject } from '@loopback/core';
import {
  Request,
  Response,
  RestBindings,
  api,
  param,
  post,
  requestBody,
} from '@loopback/rest';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';

@authorize({ allowedRoles: [FixedUserRoles.SUPER_ADMIN, FixedUserRoles.ADMIN] })
@authenticate(Authentication.STRATEGY_JWT)
@api({ basePath: RestPaths.META_LINK })
export class MetaLinkController {
  constructor(
    @inject('services.MetaLinkService')
    private metaLinkService: MetaLinkService,
  ) {}

  // ------------------------------------------------------------------------------------
  @post('{bucket}/upload', {
    responses: {
      '200': {
        description: 'upload',
        content: {
          'application/json': {
            schema: { type: 'object' },
          },
        },
      },
    },
  })
  async upload(
    @param.path.string('bucket') bucket: string,
    @requestBody.file({
      description: 'multipart/form-data value',
      required: true,
    })
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    const files = await parseMultipartBody(request, response);
    if (!files) {
      return [];
    }
    const metaLinks = [];
    for (const file of files) {
      const metaLink = await this.metaLinkService.createMetaLink({
        bucket,
        buffer: file.buffer,
        fileName: file.originalname,
      });
      metaLinks.push(metaLink);
    }
    return metaLinks;
  }
}
