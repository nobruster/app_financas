import { redirect } from 'next/navigation'

// Cadastro externo desabilitado — usuários são criados apenas pelo administrador
export default function SignupPage() {
  redirect('/login')
}
