'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toggleUserStatus } from '@/actions/profiles'

interface ToggleStatusButtonProps {
  userId: string
  userEmail: string
  currentStatus: string
}

export function ToggleStatusButton({ userId, userEmail, currentStatus }: ToggleStatusButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)

  const isActive = status === 'approved'

  async function handleConfirm() {
    setLoading(true)
    const result = await toggleUserStatus(userId, status)
    if (result.success && result.newStatus) {
      setStatus(result.newStatus)
    }
    setLoading(false)
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`px-3 py-1 text-xs font-medium border rounded-md transition-colors ${
          isActive
            ? 'border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950'
            : 'border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950'
        }`}
      >
        {isActive ? 'Desativar' : 'Ativar'}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isActive ? 'Desativar usuário' : 'Ativar usuário'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isActive
                ? <>Deseja desativar o acesso de <span className="font-medium text-foreground">{userEmail}</span>? O usuário não conseguirá entrar no sistema.</>
                : <>Deseja reativar o acesso de <span className="font-medium text-foreground">{userEmail}</span>? O usuário poderá entrar normalmente.</>
              }
            </p>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={loading}
                className={`flex-1 ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'} text-white`}
              >
                {loading ? 'Salvando...' : isActive ? 'Sim, desativar' : 'Sim, ativar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
