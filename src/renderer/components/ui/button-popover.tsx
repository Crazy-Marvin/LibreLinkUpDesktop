import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';
import { Cross2Icon } from '@radix-ui/react-icons';

interface ButtonPopoverChildren {
  trigger: React.ReactElement;
  content: React.ReactNode;
}

interface ButtonPopoverProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Popover.Root>,
    'children'
  > {
  children: ButtonPopoverChildren;
  className?: string;
  contentProps?: React.ComponentPropsWithoutRef<typeof Popover.Content>;
}

const ButtonPopover = React.forwardRef<HTMLDivElement, ButtonPopoverProps>(
  ({ children, className, ...props }, ref) => (
    <Popover.Root {...props}>
      <Popover.Trigger asChild>{children.trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={cn('relative', className)}
          ref={ref}
          {...props.contentProps}
        >
          {children.content}
          <Popover.Close className={cn('font-inherit rounded-full h-6 w-6 inline-flex items-center justify-center text-popover-foreground absolute top-1 right-1')} aria-label="Close">
          <Cross2Icon />
        </Popover.Close>
          <Popover.Arrow className={cn('fill-current text-popover')} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
);

ButtonPopover.displayName = 'ButtonPopover';

export { ButtonPopover };
