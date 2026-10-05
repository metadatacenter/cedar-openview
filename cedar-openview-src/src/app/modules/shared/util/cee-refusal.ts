/** The part of the CEDAR Embeddable Editor's element this reads. */
interface CeeElement extends HTMLElement {
  readonly currentMetadata?: object;
}

/**
 * Calls `refused` if the editor refuses the artifact it was given.
 *
 * CEE builds no form for a template or instance it cannot read, such as one whose child is stored
 * under a reserved key, and reports why through its event handler's `error`. That channel also carries
 * problems that do not stop the form, so it cannot say on its own whether the form is there. CEE's
 * public API names the signal that can: `currentMetadata` is an empty object after an input is
 * refused. It is read once the element is defined and has received its inputs.
 */
export function whenCeeRefuses(editor: CeeElement, refused: () => void): void {
  void customElements.whenDefined('cedar-embeddable-editor').then(() =>
    setTimeout(() => {
      let metadata: object | undefined;
      try {
        metadata = editor.currentMetadata;
      } catch {
        metadata = undefined;
      }
      if (!metadata || Object.keys(metadata).length === 0) refused();
    }),
  );
}
