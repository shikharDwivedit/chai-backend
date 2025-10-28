import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    
    //TODO: create playlist
    
    if(name === "" && description === ""){
        throw new ApiError(400,"Can't leave anyone of the field blank")
    }

    const userPlaylist = await Playlist.create({
        name,
        description,
        owner:req.user._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200,userPlaylist,"Created playlist successfully."))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    const playlists = await Playlist.find({
        owner:userId
    })

    return res
    .status(200)
    .json(new ApiResponse(200,playlists,"Fetched all the playlists created by user."))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "ID is not valid.")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, "Playlist doesn't exist")
    }   

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Fetched desired playlist successfully."))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "ID is not valid.")
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(400,"This playlist doesn't exist");
    }
    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(200,"Only the author is allowed to add videos to the playlist.")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"This video doesn't exist");
    }


    // check if video exists or not
    if(playlist.videos.length>0){
        const alreadyAdded = playlist.videos.some(vid => vid._id.toString() === videoId.toString())
        if(alreadyAdded){
            throw new ApiError(400,"Video already exists in playlist.")
        }
    }
    playlist.videos.push(videoId)
    await playlist.save()

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Video successfully added to playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "ID is not valid.")
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(400,"This playlist doesn't exist");
    }
    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(200,"Only the author is allowed to delete the playlist.")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"This video doesn't exist");
    }
    
    let arr = playlist.videos;

    arr = arr.filter(item => item._id.toString() != videoId.toString())
    playlist.videos = arr;
    await playlist.save()

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Video removed successfully."))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "ID is not valid.")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, "Playlist doesn't exist")
    }   

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(200,"Only the author is allowed to delete the playlist.")
    }
    await playlist.remove()

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Playlist removed successfully."))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(name === "" && description === ""){
        throw new ApiError(400,"Can't leave anyone of the field blank")
    }


    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "ID is not valid.")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400, "Playlist doesn't exist")
    }   

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(200,"Only the author is allowed to delete the playlist.")
    }
    
    playlist.name = name;
    playlist.description = description;
    await playlist.save()

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Fields updated successfully."))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}