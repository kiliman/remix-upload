# Remix Upload Example

This example shows off the `unstable_parseMultipartFormData` API. Due to
a bug in v1.1.3, we use `patch-package` to fix the issue.

This creates a customer `UploadHandler` which converts the file stream to a
`Blob` that is then sent to Cloudinary via `fetch`.

Copy the _.env.sample_ file and name it _.env_

See example at https://remix-upload.onrender.com/
