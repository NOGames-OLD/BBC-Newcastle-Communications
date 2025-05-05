import { useState, useEffect } from 'react'
import React from 'react';
import { Amplify } from 'aws-amplify';
import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';
import awsconfig from './aws-exports';
//import amplifyconfig from './amplifyconfiguration.json';
import { uploadData } from 'aws-amplify/storage';
import { downloadData } from 'aws-amplify/storage';
//Amplify.configure(amplifyconfig);
Amplify.configure(awsconfig);

function App({ signOut }) {

  const [fileData, setFileData] = useState([])
  const [mainFeed, setMainFeed] = useState([])
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)

  const uploadFile = async (file) => {
    try{
      uploadData({
        path: file.name,
        data: file
      });
      console.log("Success", file.name)
    } catch (error){
      console.log("Error: ", error)
    }
  };

  const updateMainFeed = function() {
    let timestamp = Date.now()
    let content = text
    let picture = image
    let newPost = {time: timestamp, content: content, image: picture}
    let newMainFeed = [newPost, ...mainFeed]
    newMainFeed.sort((a, b) => b.time - a.time)
    setMainFeed(newMainFeed)

    setText('')
    setImage(null)
    localStorage.setItem('mainfeed', JSON.stringify(newMainFeed))
    blob = new Blob([mainFeed], { type: 'text/plain' });
    setFileData(blob)
    console.log(fileData.name)
    console.log(fileData.type)
    console.log(fileData)
    uploadFile(fileData)
  }

  const handleText = function(event) {
    setText(event.target.value)
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    const reader = new FileReader()

    const maxSize = 250000;

    if (file.size > maxSize) {
      console.log("File size must be less than 250KB");
      return;
    }

    if(file){
      reader.readAsDataURL(file)
    }

    reader.onloadend = () => {
      console.log('Image uploaded:', reader.result)
      setImage(reader.result)
    }
  }

  useEffect(() => {
    const storedFeed = localStorage.getItem('mainfeed')
    if (storedFeed) {
      setMainFeed(JSON.parse(storedFeed))
    }
  }, []) 

  const mainFeedJSX = mainFeed.map((entry, index) => {
    const date = new Date(entry.time)
    const dateString = date.toDateString()
    const timeString = date.toLocaleTimeString()
    const imageString = entry.image

    if(imageString != null){

      return(
        <div key={index} className="m-2 p-2 w-100">
          <div className="text-md text-gray-500">{dateString}: {timeString}</div>
          <div className="text-lg">{entry.content}</div>
          <img src={entry.image} className='w-32 h-32'/>
        </div>
      )

    }else{

      return(
        <div key={index} className="m-2 p-2 w-100">
          <div className="text-md text-gray-500">{dateString}: {timeString}</div>
          <div className="text-lg">{entry.content}</div>
        </div>
      )

    }
  })

  return (
    <>
      <div className="p-2 flex flex-col items-center">

        <img src="BBCLogo.png" alt="Something is going wrong"/>

        <button onClick={signOut}>Sign out</button>

        <h1>Posts</h1>

        <textarea 
          className='m-2 p-2 w-100 border rounded' 
          value={text} 
          onChange={ (event) => handleText(event) }
        />

        <h2>Upload image:</h2>
        <input 
          type="file" 
          className="m-2 p-2 w-50 bg-slate-200 border rounded"
          onChange={handleImageUpload} 
        />

        <button className="m-2 p-2 w-50 bg-green-500 text-white rounded"
          onClick={ () => updateMainFeed() }>
          Create Post
        </button>

        {mainFeedJSX}

      </div>
    </>
  )
}

export default withAuthenticator(App);
