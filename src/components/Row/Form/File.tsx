import { useFilePicker } from 'use-file-picker'

const File = () => {
  const [openFileSelector, { filesContent, loading }] = useFilePicker({
    accept: '.txt',
  })

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <button onClick={() => openFileSelector()}>Select files </button>
      <br />
      {filesContent.map((file, index) => (
        <div key={index}>
          <h2>{file.name}</h2>
          <div key={index}>{file.content}</div>
          <br />
        </div>
      ))}
    </div>
  )
}

export default File
