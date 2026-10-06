import {Injectable} from '@angular/core';

@Injectable()
export class TemplateService {

  constructor() {
  }

  static schemaOf(node: any): any {
    return (node && node.type === 'array' && node.items) ? node.items : node;
  }

  static isBasedOn(schema: any) {
    return schema['schema:isBasedOn'];
  }

  static getId(schema: any) {
    return schema['@id'];
  }

  static getName(schema: any) {
    return schema['schema:name'];
  }

  static getHelp(schema: any) {
    return schema['schema:description'];
  }

  static setBasedOn(instance: any, id: string) {
    instance['schema:isBasedOn'] = id;
    return instance;
  }

  static setHelp(instance: any, help: string) {
    instance['schema:description'] = help;
    return instance;
  }

  static setName(instance: any, name: string) {
    instance['schema:name'] = name;
    return instance;
  }

}
