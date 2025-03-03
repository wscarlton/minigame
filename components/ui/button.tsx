import * as React from "react"

const Button = React.forwardRef
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return 'bg-primary text-primary-foreground hover:bg-primary/90'
      case 'destructive':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
      case 'outline':
        return 'border border-input hover:bg-accent hover:text-accent-foreground'
      case 'secondary':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      case 'ghost':
        return 'hover:bg-accent hover:text-accent-foreground'
      case 'link':
        return 'text-primary underline-offset-4 hover:underline'
      default:
        return 'bg-primary text-primary-foreground hover:bg-primary/90'
    }
  }

  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${getVariantClasses()} ${className}`}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
