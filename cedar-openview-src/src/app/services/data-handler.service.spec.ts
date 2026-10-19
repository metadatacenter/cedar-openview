import {of} from 'rxjs';
import {JsonSourcePolicy} from 'cedar-model-typescript-library/policy';
import {DataHandlerService} from './data-handler.service';
import {DataStoreService} from './data-store.service';
import {DataHandlerDataId} from '../modules/shared/model/data-handler-data-id.model';

describe('OpenView artifact ownership', () => {
  for (const [kind, getter] of [
    [DataHandlerDataId.TEMPLATE, 'getTemplate'],
    [DataHandlerDataId.TEMPLATE_ELEMENT, 'getTemplateElement'],
    [DataHandlerDataId.TEMPLATE_FIELD, 'getTemplateField'],
    [DataHandlerDataId.TEMPLATE_INSTANCE, 'getTemplateInstance'],
  ] as const) {
    it(`hands ${kind} to CEE as plain JSON with exact values`, () => {
      const source = '{"@id":"urn:artifact","schema:name":"Study","N":9007199254740993,"D":0.10000000000000001}';
      const artifact = JsonSourcePolicy.parse(source);
      const store = new DataStoreService();
      const loader = {[getter]: () => of(artifact)};
      const args = [store, {show() {}, hide() {}}, loader, loader, loader, loader, {}] as unknown as ConstructorParameters<typeof DataHandlerService>;
      let ready = false;
      new DataHandlerService(...args).requireId(kind, 'item').load(() => {ready = true;});
      expect(ready).toBe(true);
      const delivered = store[getter]('item');
      // This is the ownership boundary used by CEE's public input coordinator.
      expect(Object.getPrototypeOf(delivered)).toBe(Object.prototype);
      expect(JsonSourcePolicy.stringify(JsonSourcePolicy.clone(delivered))).toBe(source);
      expect(JsonSourcePolicy.stringify(artifact)).toBe(source);
    });
  }
});
