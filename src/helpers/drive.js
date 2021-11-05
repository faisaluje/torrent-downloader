const { google } = require('googleapis')
const { client_id, client_secret, redirect_uris } = require('../../credentials.json')
const token = require('../../token.json')

function getGoogleAuth() {
  const OAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
  OAuth2Client.setCredentials(token)

  return OAuth2Client
}

function getDrive() {
  const auth = getGoogleAuth()

  return google.drive({ version: 'v3', auth })
}

async function createFolder(folderName, folderId = '1IcIfWnxn1JZlcvef658XlvSQdjsy3Pj3') {
  const drive = getDrive()

  try {
    const result = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [folderId],
      },
      fields: 'id',
    })

    return result.data.id
  } catch (error) {
    console.error(error)

    return null
  }
}

async function uploadFile(fileName, fileBody, folderId) {
  const drive = getDrive()

  try {
    const result = await drive.files.create(
      {
        requestBody: {
          name: fileName,
          parents: [folderId],
        },
        media: {
          body: fileBody,
        },
        fields: 'id',
      },
      {
        onUploadProgress: (progress) => {
          megabyteUploaded = Number(progress.bytesRead) / 1024 / 1024
          process.stdout.clearLine()
          process.stdout.cursorTo(0)
          process.stdout.write(`File ${fileName} ${megabyteUploaded.toFixed(3)} Mb uploaded`)
        },
      }
    )

    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    return result.data.id
  } catch (error) {
    console.error(error)

    return null
  }
}

module.exports = {
  createFolder,
  uploadFile,
}
