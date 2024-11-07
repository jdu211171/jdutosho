import {DataTable} from "~/components/tasks/data-table";
import {columns} from "~/components/tasks/columns";

export const metadata = {
    title: "Tasks",
    description: "A task and issue tracker build using Tanstack Table.",
}

export default function TaskPage() {
    const tasks = [
        {
            "id": "TASK-7878",
            "title": "Try to calculate the EXE feed, maybe it will index the multi-byte pixel!",
            "status": "backlog",
            "label": "documentation",
            "priority": "medium"
        },
        {
            "id": "TASK-7839",
            "title": "We need to bypass the neural TCP card!",
            "status": "todo",
            "label": "bug",
            "priority": "high"
        }
    ]
    return (
        <DataTable data={tasks} columns={columns}/>
    )
}