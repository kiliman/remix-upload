import {
  LoaderFunction,
  ActionFunction,
  Form,
  useActionData,
  unstable_parseMultipartFormData,
  unstable_createFileUploadHandler,
} from 'remix'

export const action: ActionFunction = async ({ request }) => {
  const handler = unstable_createFileUploadHandler({
    directory: `${process.cwd()}/public/uploads`,
    file: ({ filename }) => filename,
    maxFileSize: 50_000_000,
  })

  const formData = await unstable_parseMultipartFormData(request, handler)
  const file = formData.get('file') as File

  return {
    url: `/uploads/${file.name}`,
    size: file.size,
  }
}
export default function Index() {
  const { url, size } = useActionData() ?? {}

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Welcome to Remix</h1>
      <Form method="post" encType="multipart/form-data" action="?index">
        <label>
          Select file: <input type="file" name="file" />
        </label>
        <button type="submit">Upload</button>
      </Form>
      {url && (
        <div>
          <img src={url} alt="Uploaded file" style={{ maxWidth: '100vw' }} />
          <p>File size: {Math.round(size / 1024)} KB</p>
        </div>
      )}
    </div>
  )
}
