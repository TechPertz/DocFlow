"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"
import type { Version } from "@/types/document"

interface VersionHistoryProps {
  versions: Version[]
  onClose: () => void
  onRevert: (version: Version) => void
}

export default function VersionHistory({ versions, onClose, onRevert }: VersionHistoryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Version History</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {versions.map((version, index) => (
              <div key={version.id} className="mb-4 border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Version {versions.length - index}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(version.createdAt).toLocaleString()} by {version.author.name}
                    </p>
                  </div>
                  <Button onClick={() => onRevert(version)}>Revert to this version</Button>
                </div>
                <div className="mt-2 text-sm">
                  {version.content.length > 100 ? `${version.content.slice(0, 100)}...` : version.content}
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  )
}

