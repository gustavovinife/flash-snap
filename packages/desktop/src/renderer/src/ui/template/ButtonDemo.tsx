import React from 'react'
import Button from '../common/Button/Button'

const ButtonDemo: React.FC = () => {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-lg font-medium mb-4">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm" variant="primary">
            Small
          </Button>
          <Button size="md" variant="primary">
            Medium
          </Button>
          <Button size="lg" variant="primary">
            Large
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">Loading State</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" isLoading>
            Loading
          </Button>
          <Button variant="secondary" isLoading>
            Loading
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">Full Width</h2>
        <div className="space-y-2">
          <Button variant="primary" fullWidth>
            Full Width Button
          </Button>
          <Button variant="secondary" fullWidth>
            Full Width Button
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">With Icons</h2>
        <div className="flex flex-wrap gap-4">
          <Button
            variant="primary"
            leftIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            Left Icon
          </Button>
          <Button
            variant="primary"
            rightIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            Right Icon
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ButtonDemo
