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
  /** When true, confirm button is primary (filled) and cancel is outline. Default: false (cancel primary). */
  confirmPrimary?: boolean;
  /** Optional custom icon; defaults to exclamation triangle. */
  icon?: React.ReactNode;
  /** Optional class for the icon container (e.g. bg-teal-100 for location dialog). */
  iconContainerClassName?: string;
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
  confirmPrimary = false,
  icon,
  iconContainerClassName = 'bg-orange-100',
  testIds = {},
  children,
}: ConfirmationDialogProps) {
  const ConfirmButton = (
    <Button
      type="button"
      onClick={onConfirm}
      variant={confirmPrimary ? 'primary' : 'outline'}
      size="sm"
      className={
        confirmPrimary
          ? 'w-full sm:w-auto sm:min-w-[120px] h-11 sm:h-9 text-base sm:text-sm font-semibold shadow-sm'
          : 'w-full sm:w-auto sm:min-w-[120px] h-11 sm:h-9 text-base sm:text-sm font-semibold border-2 border-gray-300 hover:border-gray-400 bg-white'
      }
      data-testid={testIds.confirm || 'confirm-dialog-discard'}
    >
      {confirmText}
    </Button>
  );
  const CancelButton = (
    <Button
      type="button"
      onClick={onCancel}
      variant={confirmPrimary ? 'outline' : 'primary'}
      size="sm"
      className={
        confirmPrimary
          ? 'w-full sm:w-auto sm:min-w-[120px] h-11 sm:h-9 text-base sm:text-sm font-semibold border-2 border-gray-300 hover:border-gray-400 bg-white'
          : 'w-full sm:w-auto sm:min-w-[120px] h-11 sm:h-9 text-base sm:text-sm font-semibold shadow-sm'
      }
      data-testid={testIds.cancel || 'confirm-dialog-keep-editing'}
    >
      {cancelText}
    </Button>
  );

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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" data-testid={testIds.backdrop || 'confirm-dialog-backdrop'} />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Card className="max-w-md w-full mx-4 transform transition-all shadow-2xl" data-testid={testIds.root || 'confirm-dialog'}>
                <Card.Header className="p-4 sm:p-6">
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 sm:gap-4">
                    <div className={`flex-shrink-0 w-14 h-14 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-sm ${iconContainerClassName}`}>
                      {icon ?? <ExclamationTriangleIcon className="h-7 w-7 sm:h-6 sm:w-6 text-orange-600" />}
                    </div>
                    <div className="flex-1 text-center sm:text-left w-full">
                      <Card.Title className="text-xl sm:text-lg font-bold text-gray-900 mb-2 sm:mb-0" data-testid={testIds.title || 'confirm-dialog-title'}>
                        {title}
                      </Card.Title>
                      <Card.Description className="mt-2 sm:mt-2 text-sm sm:text-sm text-gray-600 leading-relaxed" data-testid={testIds.message || 'confirm-dialog-message'}>
                        {message}
                      </Card.Description>
                      {children}
                    </div>
                  </div>
                  <div className="mt-6 sm:mt-4 flex flex-col-reverse sm:flex-row gap-3 sm:gap-3 sm:justify-end">
                    {CancelButton}
                    {ConfirmButton}
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