import { Button } from '@nextui-org/react'
import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

function App() {

  return (
    <>
      <RouterProvider router={router}>

      </RouterProvider>
      <Button color="primary">
        Button
      </Button>
    </>
  )
}

export default App
