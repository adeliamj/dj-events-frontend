import { useState } from 'react'
import { API_URL } from '@/config/index'
import styles from '@/styles/Form.module.css'

export default function ImageUpload({ evtId, imageUploaded, token }) {
  const [image, setImage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!image) {
      alert('Please select an image first')
      return
    }

    if (!evtId) {
      console.error("Error: evtId is undefined!")
      alert("Event ID is missing. Cannot upload image.")
      return
    }

    const formData = new FormData()
    formData.append('files', image, image.name);
    formData.append('ref', 'api::event.event') 
    formData.append('refId', evtId)  
    formData.append('field', 'image') 

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error('Upload failed:', errorData)
        alert(`Upload failed: ${errorData.error.message}`)
        return
      }

      imageUploaded()
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('An error occurred while uploading the image')
    }
  }

  const handleFileChange = (e) => {
    setImage(e.target.files[0])
  }

  return (
    <div className={styles.form}>
      <h1>Upload Event Image</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.file}>
          <input type='file' onChange={handleFileChange} />
        </div>
        <input type='submit' value='Upload' className='btn' />
      </form>
    </div>
  )
}
