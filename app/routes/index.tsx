import type { Readable } from 'stream'
import {
  ActionFunction,
  Form,
  useActionData,
  unstable_parseMultipartFormData,
  json,
} from 'remix'

export const action: ActionFunction = async ({ request, context }) => {
  const formData = await context.parseMultipartFormData()
  const result = await uploadCloudinary(formData.get('file'))
  return json(result)
}

export default function Index() {
  const data = useActionData() ?? {}
  const { secure_url, bytes } = data
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Upload Image to Cloudinary</h1>
      <p style={{ maxWidth: '600px' }}>
        This example will use the <code>unstable_parseMultipartFormData</code>{' '}
        to convert the uploaded file stream to a <code>Blob</code> that is sent
        to Cloudinary via the <code>fetch</code> API
      </p>

      <Form method="post" encType="multipart/form-data" action="?index">
        <label>
          Select file: <input type="file" name="file" />
        </label>
        <button type="submit">Upload</button>
      </Form>
      {secure_url && (
        <div>
          <pre>{JSON.stringify(data, null, 2)}</pre>
          <img
            src={secure_url}
            alt="Uploaded file"
            style={{ maxWidth: '100vw' }}
          />
          <p>File size: {Math.round(bytes / 1024)} KB</p>
        </div>
      )}
    </div>
  )
}

function streamToBlob(stream: Readable, mimeType?: string): Promise<Blob> {
  if (mimeType && typeof mimeType !== 'string') {
    throw new Error('Invalid mimetype, expected string.')
  }
  return new Promise((resolve, reject) => {
    const chunks: any = []
    stream
      .on('data', chunk => chunks.push(chunk))
      .once('end', () => {
        const blob = mimeType
          ? new Blob(chunks, { type: mimeType })
          : new Blob(chunks)
        resolve(blob)
      })
      .once('error', reject)
  })
}

async function uploadCloudinary(file: File): Promise<any> {
  const formData = new FormData()
  formData.set('api_key', String(process.env.CLOUDINARY_API_KEY))
  formData.set('upload_preset', 'default')
  formData.set('file', file)
  const url = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  })
  if (response.ok) {
    return response.json()
  }
  throw new Error(`${response.status} ${response.statusText}`)
}
