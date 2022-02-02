const path = require('path')
const { createRequestHandler } = require('@remix-run/netlify')
const Busboy = require('busboy')

const BUILD_DIR = path.join(process.cwd(), 'netlify')

function purgeRequireCache() {
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key]
    }
  }
}

exports.handler = (event, context) => {
  if (process.env.NODE_ENV !== 'production') {
    purgeRequireCache()
  }
  return createRequestHandler({
    build: require('./build'),
    getLoadContext: event => ({
      parseMultipartFormData: () => parseMultipartFormData(event),
    }),
  })(event, context)
}

function parseMultipartFormData(event) {
  return new Promise(resolve => {
    const formData = new FormData()
    const busboy = new Busboy({
      headers: event.headers,
    })

    busboy.on('file', (fieldname, stream, filename, encoding, mimeType) => {
      stream.on('data', data => {
        const file = new File([data], filename, { type: mimeType })
        formData.set(fieldname, file)
      })
    })

    busboy.on('field', (fieldname, value) => {
      formData.set(fieldname, value)
    })

    busboy.on('finish', () => {
      resolve(formData)
    })

    let body = event.body
    if (event.isBase64Encoded) {
      body = Buffer.from(event.body, 'base64')
    }
    busboy.write(body)
  })
}
