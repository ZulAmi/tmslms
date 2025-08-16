'use client';

import {
  Button,
  Card,
  Input,
  Badge,
  Container,
  Grid,
  Flex,
  Stack,
} from '@tmslms/ui';

export default function ComponentShowcase() {
  const sampleTableData = [
    {
      id: 1,
      course: 'Advanced React',
      students: 156,
      completion: 85,
      status: 'Active',
    },
    {
      id: 2,
      course: 'TypeScript Basics',
      students: 89,
      completion: 92,
      status: 'Active',
    },
    {
      id: 3,
      course: 'Node.js Backend',
      students: 234,
      completion: 78,
      status: 'Active',
    },
    {
      id: 4,
      course: 'Database Design',
      students: 67,
      completion: 45,
      status: 'Draft',
    },
  ];

  return (
    <Container size="xl" className="py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">🎨 TMSLMS UI Component Library</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A comprehensive showcase of our professional, modern, and accessible
          UI components built with React, TypeScript, and Tailwind CSS.
        </p>
      </div>

      {/* Success Banner */}
      <div className="bg-gradient-to-r from-success/10 via-success/5 to-transparent border border-success/20 rounded-lg p-6">
        <Flex align="center" gap={3}>
          <div className="h-8 w-8 bg-success rounded-full flex items-center justify-center">
            <svg
              className="h-5 w-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-success">
              Implementation Complete!
            </h3>
            <p className="text-success/80">
              Professional UI/UX system successfully implemented with modern
              design patterns.
            </p>
          </div>
        </Flex>
      </div>

      {/* Button Components */}
      <Card className="p-8 space-y-6">
        <h2 className="text-2xl font-bold">Button Components</h2>

        <div className="space-y-6">
          {/* Button Variants */}
          <div>
            <h3 className="text-lg font-medium mb-3">Variants</h3>
            <Flex gap={3} wrap>
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
            </Flex>
          </div>

          {/* Button Sizes */}
          <div>
            <h3 className="text-lg font-medium mb-3">Sizes</h3>
            <Flex gap={3} align="center">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </Flex>
          </div>

          {/* Loading States */}
          <div>
            <h3 className="text-lg font-medium mb-3">Loading States</h3>
            <Flex gap={3}>
              <Button loading>Loading...</Button>
              <Button loading variant="outline" loadingText="Processing">
                Processing
              </Button>
              <Button loading variant="success" />
            </Flex>
          </div>

          {/* Icon Buttons */}
          <div>
            <h3 className="text-lg font-medium mb-3">With Icons</h3>
            <Flex gap={3}>
              <Button
                leftIcon={
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                }
              >
                Add New
              </Button>
              <Button
                variant="outline"
                rightIcon={
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                }
              >
                Continue
              </Button>
              <Button variant="ghost" size="icon">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </Button>
            </Flex>
          </div>
        </div>
      </Card>

      {/* Card Components */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Card Components</h2>

        <Grid cols={3} gap={6}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Default Card</h3>
            <p className="text-muted-foreground">
              A basic card with default styling and subtle shadows.
            </p>
          </Card>

          <Card variant="elevated" className="p-6">
            <h3 className="text-lg font-semibold mb-2">Elevated Card</h3>
            <p className="text-muted-foreground">
              Enhanced card with more prominent shadow and visual depth.
            </p>
          </Card>

          <Card variant="outlined" className="p-6">
            <h3 className="text-lg font-semibold mb-2">Outlined Card</h3>
            <p className="text-muted-foreground">
              Card with border emphasis and minimal shadow.
            </p>
          </Card>
        </Grid>

        <Grid cols={2} gap={6}>
          <Card variant="gradient" className="p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Gradient Card</h3>
            <p className="text-white/80">
              Beautiful gradient background with optimized text contrast.
            </p>
            <Button className="mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30">
              Get Started
            </Button>
          </Card>

          <Card interactive className="p-6 cursor-pointer">
            <h3 className="text-lg font-semibold mb-2">Interactive Card</h3>
            <p className="text-muted-foreground mb-4">
              Clickable card with hover effects and focus states.
            </p>
            <Badge variant="success">Active</Badge>
          </Card>
        </Grid>
      </div>

      {/* Form Components */}
      <Card className="p-8 space-y-6">
        <h2 className="text-2xl font-bold">Form Components</h2>

        <Grid cols={2} gap={8}>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Input Variants</h3>

            <Input placeholder="Default input" />

            <Input
              type="password"
              placeholder="Password input"
              leftIcon={
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
            />

            <Input
              placeholder="Search..."
              rightIcon={
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
            />

            <Input
              error
              placeholder="Input with error state"
              helperText="This field is required"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sample Form</h3>

            <Stack gap={4}>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <Input type="email" placeholder="Enter your email" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>
                <Input type="password" placeholder="Enter your password" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  rows={3}
                  placeholder="Enter your message..."
                />
              </div>

              <Button className="w-full">Submit Form</Button>
            </Stack>
          </div>
        </Grid>
      </Card>

      {/* Badge Components */}
      <Card className="p-8 space-y-6">
        <h2 className="text-2xl font-bold">Badge Components</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Variants</h3>
            <Flex gap={2}>
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
            </Flex>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Sizes</h3>
            <Flex gap={2} align="center">
              <Badge size="sm">Small</Badge>
              <Badge size="default">Default</Badge>
              <Badge size="lg">Large</Badge>
            </Flex>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Status Examples</h3>
            <Flex gap={2}>
              <Badge variant="success">Active</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="destructive">Inactive</Badge>
              <Badge variant="outline">Draft</Badge>
            </Flex>
          </div>
        </div>
      </Card>

      {/* Layout Components */}
      <Card className="p-8 space-y-6">
        <h2 className="text-2xl font-bold">Layout Components</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Grid System</h3>
            <Grid cols={4} gap={4} className="mb-4">
              <div className="bg-primary/10 border border-primary/20 rounded p-4 text-center">
                <span className="text-sm font-medium">Col 1</span>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded p-4 text-center">
                <span className="text-sm font-medium">Col 2</span>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded p-4 text-center">
                <span className="text-sm font-medium">Col 3</span>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded p-4 text-center">
                <span className="text-sm font-medium">Col 4</span>
              </div>
            </Grid>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Flex Layout</h3>
            <Flex
              justify="between"
              align="center"
              className="bg-muted/30 p-4 rounded-lg"
            >
              <div className="bg-primary/10 border border-primary/20 rounded p-2">
                <span className="text-sm">Left Item</span>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded p-2">
                <span className="text-sm">Center Item</span>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded p-2">
                <span className="text-sm">Right Item</span>
              </div>
            </Flex>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Stack Layout</h3>
            <Stack gap={3} className="bg-muted/30 p-4 rounded-lg max-w-md">
              <div className="bg-primary/10 border border-primary/20 rounded p-3">
                <span className="text-sm">Stack Item 1</span>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded p-3">
                <span className="text-sm">Stack Item 2</span>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded p-3">
                <span className="text-sm">Stack Item 3</span>
              </div>
            </Stack>
          </div>
        </div>
      </Card>

      {/* Sample Data Table */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6">Table Component</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium">Course Name</th>
                <th className="text-left py-3 px-4 font-medium">Students</th>
                <th className="text-left py-3 px-4 font-medium">Completion</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sampleTableData.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border hover:bg-muted/30"
                >
                  <td className="py-3 px-4 font-medium">{row.course}</td>
                  <td className="py-3 px-4">{row.students}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 max-w-[100px]">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${row.completion}%` }}
                        />
                      </div>
                      <span className="text-sm">{row.completion}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={row.status === 'Active' ? 'success' : 'outline'}
                      size="sm"
                    >
                      {row.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Flex gap={1}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Flex>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Final CTA */}
      <div className="text-center space-y-6">
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Build Amazing Learning Experiences?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            This comprehensive UI system provides everything you need to create
            professional, accessible, and beautiful learning management
            applications.
          </p>
          <Flex justify="center" gap={4}>
            <Button
              size="lg"
              leftIcon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
            >
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              View Documentation
            </Button>
          </Flex>
        </div>
      </div>
    </Container>
  );
}
