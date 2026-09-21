"use client"

import { cn } from "@/lib/utils"
import {
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
} from "lucide-react"
import {
  createContext,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
} from "react"

// Module-level so the defaults never change identity between renders.
const NO_IDS: string[] = []
const NO_PATH: boolean[] = []

type TreeContextType = {
  expandedIds: Set<string>
  selectedIds: string[]
  toggleExpanded: (nodeId: string) => void
  handleSelection: (nodeId: string, ctrlKey: boolean) => void
  showLines?: boolean
  showIcons?: boolean
  selectable?: boolean
  multiSelect?: boolean
  indent?: number
  animateExpand?: boolean
}

const TreeContext = createContext<TreeContextType | undefined>(undefined)

const useTree = () => {
  const context = useContext(TreeContext)
  if (!context) {
    throw new Error("Tree components must be used within a TreeProvider")
  }
  return context
}

type TreeNodeContextType = {
  nodeId: string
  level: number
  isLast: boolean
  parentPath: boolean[]
}

const TreeNodeContext = createContext<TreeNodeContextType | undefined>(
  undefined
)

const useTreeNode = () => {
  const context = useContext(TreeNodeContext)
  if (!context) {
    throw new Error("TreeNode components must be used within a TreeNode")
  }
  return context
}

export type TreeProviderProps = {
  children: ReactNode
  defaultExpandedIds?: string[]
  showLines?: boolean
  showIcons?: boolean
  selectable?: boolean
  multiSelect?: boolean
  selectedIds?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  indent?: number
  animateExpand?: boolean
  className?: string
}

export const TreeProvider = ({
  children,
  defaultExpandedIds = NO_IDS,
  showLines = true,
  showIcons = true,
  selectable = true,
  multiSelect = false,
  selectedIds,
  onSelectionChange,
  indent = 20,
  animateExpand = true,
  className,
}: TreeProviderProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(defaultExpandedIds)
  )
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>(
    selectedIds ?? []
  )

  const isControlled =
    selectedIds !== undefined && onSelectionChange !== undefined
  const currentSelectedIds = isControlled ? selectedIds : internalSelectedIds

  const toggleExpanded = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }, [])

  const handleSelection = useCallback(
    (nodeId: string, ctrlKey = false) => {
      if (!selectable) return

      let newSelection: string[]

      if (multiSelect && ctrlKey) {
        newSelection = currentSelectedIds.includes(nodeId)
          ? currentSelectedIds.filter((id) => id !== nodeId)
          : [...currentSelectedIds, nodeId]
      } else {
        newSelection = currentSelectedIds.includes(nodeId) ? [] : [nodeId]
      }

      if (isControlled) {
        onSelectionChange?.(newSelection)
      } else {
        setInternalSelectedIds(newSelection)
      }
    },
    [
      selectable,
      multiSelect,
      currentSelectedIds,
      isControlled,
      onSelectionChange,
    ]
  )

  const value = useMemo(
    () => ({
      expandedIds,
      selectedIds: currentSelectedIds,
      toggleExpanded,
      handleSelection,
      showLines,
      showIcons,
      selectable,
      multiSelect,
      indent,
      animateExpand,
    }),
    [
      expandedIds,
      currentSelectedIds,
      toggleExpanded,
      handleSelection,
      showLines,
      showIcons,
      selectable,
      multiSelect,
      indent,
      animateExpand,
    ]
  )

  return (
    <TreeContext.Provider value={value}>
      <div className={cn("w-full", className)}>{children}</div>
    </TreeContext.Provider>
  )
}

export type TreeViewProps = HTMLAttributes<HTMLDivElement>
export const TreeView = ({ className, children, ...props }: TreeViewProps) => (
  <div className={cn("p-2", className)} {...props}>
    {children}
  </div>
)

export type TreeNodeProps = HTMLAttributes<HTMLDivElement> & {
  nodeId?: string
  level?: number
  isLast?: boolean
  parentPath?: boolean[]
  children?: ReactNode
}

export const TreeNode = ({
  nodeId: providedNodeId,
  level = 0,
  isLast = false,
  parentPath = NO_PATH,
  children,
  className,
  ...props
}: TreeNodeProps) => {
  const generatedId = useId()
  const nodeId = providedNodeId ?? generatedId

  // Built inside the memo so the derived array does not change identity each render.
  const value = useMemo(() => {
    if (level === 0) return { nodeId, level, isLast, parentPath: NO_PATH }

    const currentPath = [...parentPath]
    while (currentPath.length < level - 1) {
      currentPath.push(false)
    }
    currentPath[level - 1] = isLast
    return { nodeId, level, isLast, parentPath: currentPath }
  }, [nodeId, level, isLast, parentPath])

  return (
    <TreeNodeContext.Provider value={value}>
      <div className={cn("select-none", className)} {...props}>
        {children}
      </div>
    </TreeNodeContext.Provider>
  )
}

export type TreeNodeTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>

// A button, not a div: these rows are the only way to change the selected file,
// so they have to be reachable and operable from the keyboard.
export const TreeNodeTrigger = ({
  children,
  className,
  onClick,
  ...props
}: TreeNodeTriggerProps) => {
  const { expandedIds, selectedIds, toggleExpanded, handleSelection, indent } =
    useTree()
  const { nodeId, level } = useTreeNode()
  const isSelected = selectedIds.includes(nodeId)

  return (
    <button
      type="button"
      aria-expanded={expandedIds.has(nodeId)}
      aria-current={isSelected ? "true" : undefined}
      className={cn(
        "group relative mx-1 flex w-full items-center rounded-md px-3 py-2 text-left transition-colors",
        "hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
        isSelected && "bg-accent/80",
        className
      )}
      onClick={(e) => {
        toggleExpanded(nodeId)
        handleSelection(nodeId, e.ctrlKey || e.metaKey)
        onClick?.(e)
      }}
      style={{ paddingLeft: level * (indent ?? 0) + 8 }}
      {...props}
    >
      <TreeLines />
      {children as ReactNode}
    </button>
  )
}

export const TreeLines = () => {
  const { showLines, indent } = useTree()
  const { level, isLast, parentPath } = useTreeNode()

  if (!showLines || level === 0) return null

  return (
    <div className="pointer-events-none absolute top-0 bottom-0 left-0">
      {Array.from({ length: level }, (_, index) => {
        const shouldHideLine = parentPath[index] === true
        if (shouldHideLine && index === level - 1) return null
        return (
          <div
            className="absolute top-0 bottom-0 border-l border-border/40"
            key={index.toString()}
            style={{
              left: index * (indent ?? 0) + 12,
              display: shouldHideLine ? "none" : "block",
            }}
          />
        )
      })}
      <div
        className="absolute top-1/2 border-t border-border/40"
        style={{
          left: (level - 1) * (indent ?? 0) + 12,
          width: (indent ?? 0) - 4,
          transform: "translateY(-1px)",
        }}
      />
      {isLast && (
        <div
          className="absolute top-0 border-l border-border/40"
          style={{
            left: (level - 1) * (indent ?? 0) + 12,
            height: "50%",
          }}
        />
      )}
    </div>
  )
}

export type TreeNodeContentProps = HTMLAttributes<HTMLDivElement> & {
  hasChildren?: boolean
}

export const TreeNodeContent = ({
  children,
  hasChildren = false,
  className,
  ...props
}: TreeNodeContentProps) => {
  const { expandedIds } = useTree()
  const { nodeId } = useTreeNode()
  const isExpanded = expandedIds.has(nodeId)

  if (!hasChildren || !isExpanded) return null

  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

export type TreeExpanderProps = HTMLAttributes<HTMLDivElement> & {
  hasChildren?: boolean
}

export const TreeExpander = ({
  hasChildren = false,
  className,
  ...props
}: TreeExpanderProps) => {
  const { expandedIds } = useTree()
  const { nodeId } = useTreeNode()
  const isExpanded = expandedIds.has(nodeId)

  if (!hasChildren) return <div className="mr-1 size-4" />

  return (
    <div
      aria-hidden="true"
      className={cn("mr-1 flex size-4 items-center justify-center", className)}
      {...props}
    >
      <ChevronRightIcon
        className={cn(
          "size-3 text-muted-foreground transition-transform duration-200",
          isExpanded && "rotate-90"
        )}
      />
    </div>
  )
}

export type TreeIconProps = HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode
  hasChildren?: boolean
}

export const TreeIcon = ({
  icon,
  hasChildren = false,
  className,
  ...props
}: TreeIconProps) => {
  const { showIcons, expandedIds } = useTree()
  const { nodeId } = useTreeNode()
  const isExpanded = expandedIds.has(nodeId)

  if (!showIcons) return null

  const getDefaultIcon = () =>
    hasChildren ? (
      isExpanded ? (
        <FolderOpenIcon className="size-4" />
      ) : (
        <FolderIcon className="size-4" />
      )
    ) : (
      <FileIcon className="size-4" />
    )

  return (
    <div
      className={cn(
        "mr-2 flex size-4 items-center justify-center text-muted-foreground",
        className
      )}
      {...props}
    >
      {icon || getDefaultIcon()}
    </div>
  )
}

export type TreeLabelProps = HTMLAttributes<HTMLSpanElement>

export const TreeLabel = ({ className, ...props }: TreeLabelProps) => (
  <span className={cn("flex-1 truncate text-sm", className)} {...props} />
)
