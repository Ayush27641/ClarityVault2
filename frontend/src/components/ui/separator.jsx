import * as React from 'react'
import { cn } from '../../lib/utils'

function Separator({ className, orientation = 'horizontal', decorative = true, ...props }) {
  return (
    <div
      data-orientation={orientation}
      decorative={decorative}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      {...props}
    />
  )
}

export { Separator }