import { useState, useEffect } from 'react'
import { useFetcher } from '@remix-run/react'
import type { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Button } from '~/components/ui/button'
import { CheckIcon, CaretSortIcon } from '@radix-ui/react-icons'
import { cn } from '~/lib/utils'
import _ from 'lodash'

interface SearchableSelectProps {
  form: UseFormReturn<any>
  name: string
  label: string
  placeholder?: string
  searchEndpoint: string
  getOptionLabel: (option: any) => string
  getOptionValue: (option: any) => string
}

export function SearchableSelect({
  form,
  name,
  label,
  placeholder,
  searchEndpoint,
  getOptionLabel,
  getOptionValue,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const fetcher = useFetcher<{ data: any[] }>()

  // Create debounced search function
  const debouncedSearch = _.debounce((value: string) => {
    if (value) {
      fetcher.load(`${searchEndpoint}?q=${value}`)
    }
  }, 300)

  useEffect(() => {
    debouncedSearch(searchTerm)
    return () => {
      debouncedSearch.cancel()
    }
  }, [searchTerm])

  const options = fetcher.data?.data || []
  const selectedValue = form.watch(name)
  const selectedOption = options.find(
    (option: any) => getOptionValue(option) === selectedValue
  )

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'w-full justify-between',
                    !field.value && 'text-muted-foreground'
                  )}
                >
                  {selectedOption
                    ? getOptionLabel(selectedOption)
                    : placeholder || 'Select option...'}
                  <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder={`Search ${label.toLowerCase()}...`}
                    className="h-9"
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                  />
                  <CommandList>
                    {fetcher.state === 'loading' && (
                      <div className="p-2">Loading...</div>
                    )}
                    {fetcher.state !== 'loading' && options.length === 0 && (
                      <CommandEmpty>No results found.</CommandEmpty>
                    )}
                    {options.map((option: any) => (
                      <CommandItem
                        key={getOptionValue(option)}
                        value={getOptionValue(option)}
                        onSelect={() => {
                          form.setValue(name, getOptionValue(option))
                          setOpen(false)
                        }}
                      >
                        {getOptionValue(option)}
                        <CheckIcon
                          className={cn(
                            'ml-auto h-4 w-4',
                            selectedValue === getOptionValue(option)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
