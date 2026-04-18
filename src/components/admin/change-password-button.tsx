'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { changeUserPassword } from '@/actions/profiles'
import { MIN_PASSWORD_LENGTH } from '@/lib/constants'

interface ChangePasswordButtonProps {
  userId: string
  userEmail: string
}

export function ChangePasswordButton({ userId, userEmail }: ChangePasswordButtonProps) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    const result = await changeUserPassword(userId, password)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => {
      setOpen(false)
      setPassword('')
      setConfirm('')
      setSuccess(false)
    }, 1500)
  }

  function handleOpen() {
    setOpen(true)
    setPassword('')
    setConfirm('')
    setError('')
    setSuccess(false)
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="px-3 py-1 text-xs font-medium border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        Alterar senha
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar senha do usuário</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground -mt-2">
            Usuário: <span className="font-medium text-foreground">{userEmail}</span>
          </p>

          {success ? (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 text-sm rounded-md px-4 py-3 text-center">
              Senha alterada com sucesso!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {error && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm rounded-md px-4 py-3">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Repita a senha"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Salvando...' : 'Salvar senha'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
