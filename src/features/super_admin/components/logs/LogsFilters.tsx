import { Calendar } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Option = { id: number; name: string }

type Props = {
  dateFrom: Date | undefined
  dateTo: Date | undefined
  setDateFrom: Dispatch<SetStateAction<Date | undefined>>
  setDateTo: Dispatch<SetStateAction<Date | undefined>>

  userFilter: string
  setUserFilter: (v: string) => void
  hotelFilter: string
  setHotelFilter: (v: string) => void
  actionFilter: string
  setActionFilter: (v: string) => void

  users: Option[]
  hotels: Option[]
  actions: string[]
}

export function LogsFilters({
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
  userFilter,
  setUserFilter,
  hotelFilter,
  setHotelFilter,
  actionFilter,
  setActionFilter,
  users,
  hotels,
  actions,
}: Props) {
  return (
    <div className="flex flex-wrap gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
            <Calendar className="mr-2 h-4 w-4" />
            {dateFrom ? (
              dateTo ? (
                <>
                  {format(dateFrom, 'LLL dd, y')} - {format(dateTo, 'LLL dd, y')}
                </>
              ) : (
                format(dateFrom, 'LLL dd, y')
              )
            ) : (
              <span>Pick date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <CalendarComponent mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
            <CalendarComponent mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
          </div>
        </PopoverContent>
      </Popover>

      <Select value={userFilter} onValueChange={setUserFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Users" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Users</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id.toString()}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={hotelFilter} onValueChange={setHotelFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Hotels" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Hotels</SelectItem>
          <SelectItem value="global">Global Actions</SelectItem>
          {hotels.map((hotel) => (
            <SelectItem key={hotel.id} value={hotel.id.toString()}>
              {hotel.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={actionFilter} onValueChange={setActionFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Actions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Actions</SelectItem>
          {actions.map((action) => (
            <SelectItem key={action} value={action}>
              {action.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}


