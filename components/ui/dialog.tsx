import * as React from "react"

const AlertDialog = ({ children, open, onOpenChange, ...props }) => {
  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {children}
    </div>
  ) : null
}

const AlertDialogContent = ({ children, className, ...props }) => {
  return (
    <div className={`w-full max-w-md overflow-hidden rounded-lg bg-white p-6 shadow-lg ${className}`} {...props}>
      {children}
    </div>
  )
}

const AlertDialogHeader = ({ className, ...props }) => {
  return <div className={`space-y-2 ${className}`} {...props} />
}

const AlertDialogFooter = ({ className, ...props }) => {
  return <div className={`flex justify-end gap-2 mt-4 ${className}`} {...props} />
}

const AlertDialogTitle = ({ className, ...props }) => {
  return <h2 className={`text-lg font-semibold ${className}`} {...props} />
}

const AlertDialogDescription = ({ className, ...props }) => {
  return <p className={`text-sm text-gray-500 ${className}`} {...props} />
}

const AlertDialogAction = ({ className, ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
}
