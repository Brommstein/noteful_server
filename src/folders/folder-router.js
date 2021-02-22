const path = require('path')
const express = require('express')
const xss = require('xss')
const FolderService = require('./folder-service')
const folderRouter = express.Router()
const jsonParser = express.json()
const serializeFolder = folder => ({
  id: folder.id,
  name: xss(folder.name)
})
folderRouter
  .route('/')
  .get((req, res, next) => {
    FolderService.getAllFolders(req.app.get('db'))
      .then(folders => {
        res.json(folders.map(serializeFolder))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { name } = req.body
    const newFolder = { name }
    if (!name) {
      return res
        .status(400)
        .json({
          error: { message: `Missing 'name' in request body` }
        })
    }
    FolderService.insertFolder(
      req.app.get('db'),
      newFolder
    )
      .then(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(serializeFolder(folder))
      })
      .catch(next)
  })
folderRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    FolderService.getById(
      req.app.get('db'),
      req.params.folder_id
    )
      .then(folder => {
        if (!folder) {
          return res
            .status(404)
            .json({
              error: { message: `Folder doesn't exist` }
            })
        }
        res.folder = folder
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeFolder(res.folder))
  })
  .delete((req, res, next) => {
    FolderService.deleteFolder(
      req.app.get('db'),
      req.params.folder_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { name } = req.body
    if (!name) {
      return res.status(400).json({
        error: {
          message: `Reqeust body needs 'name'`
        }
      })
    }
    const folderToUpdate = { name }
    FolderService.updateFolder(
      req.app.get('db'),
      req.params.folder_id,
      folderToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
module.exports = folderRouter