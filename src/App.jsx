import { useState } from 'react';
import axios from 'axios'

import {Card, CardHeader, CardBody, CardFooter} from "@nextui-org/react";
import {Button, ButtonGroup} from "@nextui-org/react";
import {Select, SelectSection, SelectItem} from "@nextui-org/react";
import {Image} from "@nextui-org/react";

import { filters } from './data';

const serverURL = 'https://image-filter-server.onrender.com'

function App() {
  const [hasSelectedFile, setHasSelectedFile] = useState(false)
  const [imageLink, setImageLink] = useState('')

  function selectFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = "image/png, image/jpeg";
    input.onchange = e => { 
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        axios.post(`${serverURL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        })
            .then(res => {
                setImageLink(`${serverURL}/${res.data}`)
                setHasSelectedFile(true)
            }).catch(error => {
                console.error(`Error posting image: ${error}`)
            })
    }

    input.click();
  }

  function onFilterSelect(e) {
    axios.get(`${serverURL}/${e.target.value}`, {
      withCredentials: true
    })
      .then(res => {
        setImageLink(`${serverURL}/${res.data}`)
      }).catch(error => {
        console.log(`Error processing filter: ${error}`)
      })
  }

  function onImageClick() {
    const fileUrl = imageLink;

    fetch(fileUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileUrl.substring(fileUrl.lastIndexOf('/') + 1));
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }

  return hasSelectedFile ? (
    <section className='w-full h-screen flex justify-center items-center flex-col gap-10 p-5'>
      <Image src={imageLink} alt='image' width={500} isBlurred isZoomed onClick={onImageClick} className='cursor-pointer'/>
      <Select label='Select a filter' className='w-60 md:w-80' onChange={onFilterSelect}>
        {filters.map((filter) => (
          <SelectItem key={filter.value} value={filter.value}>
            {filter.label}
          </SelectItem>
        ))}
      </Select>

    </section>
  ) : (
    <section className='w-full h-screen flex justify-center items-center flex-col gap-10 p-5'>
      <h1 className='text-4xl md:text-6xl font-bold text-center'>Filter your images</h1>
      <Card className='flex justify-center items-center flex-col p-10 gap-10 hover:bg-[#cce3fd] border-dashed border-2 cursor-pointer'
        isPressable={true} onPress={selectFile}>
        <span className='text-3xl block'>+</span>
        <span className='text-3xl block'>Drag or upload your images</span>
        <Button color='primary' size='lg' onClick={selectFile}>Upload</Button>
      </Card>
    </section>
  )
}

export default App
