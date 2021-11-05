const fs = require('fs')
const path = require('path')
const driveHelper = require('./helpers/drive')

function getDirContents(dirPath) {
  try {
    const contents = fs.readdirSync(dirPath, { withFileTypes: true })

    return contents
  } catch (error) {
    console.error(contents)
    throw new Error('Cannot find the directory')
  }
}

async function uploadFile(folderPath, fileName, folderId) {
  const file = fs.createReadStream(path.join(folderPath, fileName))

  const result = await driveHelper.uploadFile(fileName, file, folderId)
  if (!result) {
    throw new Error('Failed to upload file')
  }
}

async function uploadToDrive(directoryPath, directoryName, parentFolderId) {
  const fullPath = path.join(directoryPath, directoryName)
  const folderId = await driveHelper.createFolder(directoryName, parentFolderId)
  if (!folderId) {
    throw new Error('Failed to create folder on drive')
  }

  const contents = getDirContents(fullPath)
  for (const content of contents) {
    if (content.isDirectory()) {
      await uploadToDrive(fullPath, content.name, folderId)
    }

    if (content.isFile()) {
      await uploadFile(fullPath, content.name, folderId)
      console.log(`File ${content.name} uploaded.`)
    }
  }

  console.log(`Folder ${directoryName} uploaded.`)
}

module.exports = {
  uploadToDrive,
}
