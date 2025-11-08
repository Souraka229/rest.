// hooks/useToast.ts
import { toast } from 'sonner'

export function useToast() {
  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right'
    })
  }

  const showError = (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right'
    })
  }

  const showLoading = (message: string) => {
    return toast.loading(message)
  }

  return {
    showSuccess,
    showError,
    showLoading,
    dismiss: toast.dismiss
  }
}
