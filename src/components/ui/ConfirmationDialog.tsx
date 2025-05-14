import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { ExclamationTriangleIcon } from './icons';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  testIds?: {
    root?: string;
    confirm?: string;
    cancel?: string;
    backdrop?: string;
    title?: string;
    message?: string;
  };
  children?: React.ReactNode;
}

export function ConfirmationDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Yes, Discard',
  cancelText = 'No, Keep Editing',
  danger = true,
  testIds = {},
  children,
}: ConfirmationDialogProps) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[60]"
        onClose={onCancel}
        data-testid={testIds.root || 'confirm-dialog'}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm transition-opacity" data-testid={testIds.backdrop || 'confirm-dialog-backdrop'} />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Card className="max-w-md w-full mx-4 transform transition-all" data-testid={testIds.root || 'confirm-dialog'}>
                <Card.Header className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <Card.Title className="text-lg font-semibold text-gray-900" data-testid={testIds.title || 'confirm-dialog-title'}>
                      {title}
                    </Card.Title>
                    <Card.Description className="mt-2 text-sm text-gray-600" data-testid={testIds.message || 'confirm-dialog-message'}>
                      {message}
                    </Card.Description>
                    {children}
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3 sm:justify-between sm:items-center">
                      <Button
                        type="button"
                        onClick={onConfirm}
                        variant="outline"
                        size="sm"
                        className="text-black w-full sm:w-auto"
                        data-testid={testIds.confirm || 'confirm-dialog-discard'}
                      >
                        {confirmText}
                      </Button>
                      <Button
                        type="button"
                        onClick={onCancel}
                        variant="primary"
                        size="sm"
                        className="w-full sm:w-auto"
                        data-testid={testIds.cancel || 'confirm-dialog-keep-editing'}
                      >
                        {cancelText}
                      </Button>
                    </div>
                  </div>
                </Card.Header>
              </Card>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 