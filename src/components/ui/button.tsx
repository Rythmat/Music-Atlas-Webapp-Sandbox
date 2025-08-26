import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../utilities';

// eslint-disable-next-line tailwindcss/no-custom-classname
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-brand-base text-grey-darkest shadow hover:bg-brand-dark active:bg-brand-darker disabled:bg-muted disabled:text-muted-foreground',
        destructive:
          'bg-danger-base text-grey-lightest shadow hover:bg-danger-light active:bg-danger-darker disabled:bg-muted disabled:text-muted-foreground',
        outline:
          'border border-input bg-shade-5/25 text-foreground shadow-sm hover:bg-shade-4/40 active:bg-shade-3/55 disabled:bg-muted disabled:text-muted-foreground',
        secondary:
          'bg-grey-darkest text-grey-lightest shadow-sm hover:bg-grey-dark active:bg-grey-base disabled:bg-muted disabled:text-muted-foreground',
        ghost:
          'bg-transparent text-brand-base hover:bg-grey-dark active:bg-grey-base disabled:bg-muted disabled:text-muted-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-full px-3 text-xs',
        lg: 'h-10 rounded-full px-8',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
