export class MulterFileExtension extends Error {
  message = "";
  constructor(message: any) {
    super();
    this.name = "MulterFileExtension";
    this.stack = new Error().stack;
    this.message = message;
  }
}
