const WebTorrent = require('webtorrent')
const path = require('path')
const fs = require('fs')
const { uploadToDrive } = require('./src/upload')

const client = new WebTorrent()
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

const magnetURI = process.argv[2]
const directoryPath = path.join(__dirname, 'torrents')

if (!magnetURI) {
  console.log('please provide the url!')
  process.exit(0)
}

client.add(magnetURI, { path: directoryPath }, function (torrent) {
  const fileSize = (torrent.length / 1024 / 1204).toFixed(2)

  torrent.on('download', function () {
    const progress = (torrent.progress * 100).toFixed(3)
    const downloaded = (torrent.downloaded / 1024 / 1024).toFixed(2)
    const downloadSpeed = (torrent.downloadSpeed / 1024 / 1024).toFixed(2)
    const remainingTime = new Date(torrent.timeRemaining)

    console.clear()
    console.log('name:', torrent.name)
    console.log('torrent size:', fileSize, 'Mb')
    console.log('total downloaded:', downloaded, 'Mb')
    console.log('download speed:', downloadSpeed, 'Mb')
    console.log('progress:', progress, '%') // percent progress
    console.log('time left:', remainingTime.getUTCMinutes(), 'minutes', remainingTime.getUTCSeconds(), 'seconds') // percent progress
  })

  torrent.on('done', async function () {
    console.log('torrent download finished\n')

    try {
      await uploadToDrive(directoryPath, torrent.name)

      fs.rmdirSync(path.join(directoryPath, torrent.name), { recursive: true })
    } catch (error) {
      console.log(error.message)
    }

    process.exit(0)
  })

  signalTraps.forEach((type) => {
    process.once(type, async () => {
      console.log('canceling all torrents. . .')

      torrent.destroy(null, (err) => {
        if (err) console.error(err)

        process.kill(process.pid, type)
      })
    })
  })
})
