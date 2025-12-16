import { useEffect } from 'react'
import { debounce } from '@/lib/utils/performance'

/**
 * Hook for auto-saving form data to localStorage
 * @param key - Unique key for localStorage
 * @param data - Data to save
 * @param enabled - Whether auto-save is enabled
 * @param interval - Debounce interval in ms (default 2000ms)
 */
export function useAutoSave<T>(
    key: string,
    data: T,
    enabled: boolean = true,
    interval: number = 2000
) {
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Create debounced save function
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSave = useCallback(
        debounce((dataToSave: T) => {
            try {
                setIsSaving(true)
                localStorage.setItem(key, JSON.stringify(dataToSave))
                setLastSaved(new Date())
                setIsSaving(false)
                // Optional: toast.success('Borrador guardado', { duration: 1000 })
            } catch (error) {
                console.error('Error auto-saving:', error)
                setIsSaving(false)
            }
        }, interval),
        [key, interval]
    )

    // Trigger save when data changes
    useEffect(() => {
        if (enabled && data) {
            debouncedSave(data)
        }
    }, [data, enabled, debouncedSave])

    // Function to manually clear draft
    const clearDraft = useCallback(() => {
        try {
            localStorage.removeItem(key)
            setLastSaved(null)
        } catch (error) {
            console.error('Error clearing draft:', error)
        }
    }, [key])

    // Function to load draft
    const loadDraft = useCallback((): T | null => {
        try {
            const saved = localStorage.getItem(key)
            if (saved) {
                return JSON.parse(saved) as T
            }
        } catch (error) {
            console.error('Error loading draft:', error)
        }
        return null
    }, [key])

    return {
        lastSaved,
        isSaving,
        clearDraft,
        loadDraft
    }
}
