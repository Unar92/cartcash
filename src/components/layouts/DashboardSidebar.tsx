'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  HomeIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  CogIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Abandoned Carts', href: '/dashboard/carts', icon: ShoppingCartIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Recovery Campaigns', href: '/dashboard/campaigns', icon: MegaphoneIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
];

export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <img
                      className="h-8 w-auto"
                      src="/cartcash-logo.png"
                      alt="CartCash"
                    />
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                className={`
                                  group flex gap-x-3 rounded-md p-2 text-sm leading-6
                                  ${pathname === item.href
                                    ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                  }
                                `}
                              >
                                <item.icon
                                  className={`h-6 w-6 shrink-0 ${
                                    pathname === item.href
                                      ? 'text-indigo-600 dark:text-indigo-400'
                                      : 'text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                                  }`}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <img
              className="h-8 w-auto"
              src="/cartcash-logo.png"
              alt="CartCash"
            />CartCash
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm leading-6
                          ${pathname === item.href
                            ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }
                        `}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${
                            pathname === item.href
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
