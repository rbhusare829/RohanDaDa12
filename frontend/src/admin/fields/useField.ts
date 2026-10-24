import { useCallback } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

/**
 * The value of one form field and a way to change it. Changing it marks the form as edited (and back to clean when the
 * old value is typed again) and takes away a problem that was shown on the field.
 * It stands in for react-hook-form's useController, whose callback ref the React lint rules cannot follow.
 */
export function useField<T = unknown>(name: string): [T, (value: T) => void] {
  const { control, setValue, clearErrors } = useFormContext()
  const value = useWatch({ control, name }) as T
  const set = useCallback(
    (next: T) => {
      setValue(name, next, { shouldDirty: true, shouldTouch: true })
      // a problem is kept on the field itself, or on its base name when one language is edited ("title" for "title.en")
      clearErrors([name, name.replace(/\.(en|mr)$/, '')])
    },
    [name, setValue, clearErrors],
  )
  return [value, set]
}
