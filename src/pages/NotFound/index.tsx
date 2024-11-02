import Logo from '@/assets/404.svg'
import { Image } from '@nextui-org/react'
export default function index() {
  return (
    <div>
      <Image src={Logo} alt="404" />
      404页面丢失了
    </div>
  )
};
