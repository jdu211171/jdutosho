import { Skeleton } from '~/components/ui/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'

interface DataTableSkeletonProps {
	columnCount?: number
	rowCount?: number
	showToolbar?: boolean
	showPagination?: boolean
}

export function DataTableSkeleton({
	columnCount = 5,
	rowCount = 10,
	showToolbar = true,
	showPagination = true,
}: DataTableSkeletonProps) {
	return (
		<div className="space-y-4">
			{showToolbar && (
				<div className="flex items-center justify-between">
					<div className="flex flex-1 items-center space-x-2">
						<Skeleton className="h-10 w-[250px]" />
						<Skeleton className="h-10 w-[100px]" />
					</div>
					<Skeleton className="h-10 w-[70px]" />
				</div>
			)}
			
			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							{Array.from({ length: columnCount }).map((_, index) => (
								<TableHead key={index}>
									<Skeleton className="h-4 w-[100px]" />
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: rowCount }).map((_, rowIndex) => (
							<TableRow key={rowIndex}>
								{Array.from({ length: columnCount }).map((_, cellIndex) => (
									<TableCell key={cellIndex}>
										<Skeleton className="h-4 w-full" />
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			
			{showPagination && (
				<div className="flex items-center justify-between px-2">
					<Skeleton className="h-8 w-[200px]" />
					<div className="flex items-center space-x-2">
						<Skeleton className="h-8 w-[100px]" />
						<Skeleton className="h-8 w-8" />
						<Skeleton className="h-8 w-8" />
						<Skeleton className="h-8 w-8" />
						<Skeleton className="h-8 w-8" />
					</div>
				</div>
			)}
		</div>
	)
}