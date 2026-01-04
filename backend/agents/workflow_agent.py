"""
Workflow / Wellbeing Agent - Optimizes schedules and balances workloads

This agent creates optimized schedules considering deadlines and wellbeing.
"""
from typing import List, Dict
from datetime import datetime, timedelta


def optimize_schedule(tasks: List[Dict], deadlines: List[Dict]) -> Dict:
    """
    Generate optimized schedule balancing deadlines and wellbeing.
    
    Args:
        tasks: List of tasks with name, duration, priority
        deadlines: List of deadlines with task_name, due_date
        
    Returns:
        Optimized schedule with time blocks
    """
    # MVP: Simple scheduling algorithm
    # Future: Advanced optimization with ML
    
    # Sort tasks by priority and deadline
    task_dict = {t["name"]: t for t in tasks}
    deadline_dict = {d["task_name"]: d["due_date"] for d in deadlines}
    
    # Combine and sort
    scheduled_tasks = []
    for task_name, task in task_dict.items():
        due_date = deadline_dict.get(task_name)
        scheduled_tasks.append({
            "task": task_name,
            "duration": task.get("duration", "1 hour"),
            "priority": task.get("priority", "medium"),
            "due_date": due_date,
            "suggested_slot": "Morning" if task.get("priority") == "high" else "Afternoon"
        })
    
    # Sort by priority and deadline
    scheduled_tasks.sort(key=lambda x: (
        {"high": 0, "medium": 1, "low": 2}.get(x["priority"], 1),
        x["due_date"] or datetime.max
    ))
    
    return {
        "schedule": scheduled_tasks,
        "total_tasks": len(scheduled_tasks),
        "recommendations": [
            "Schedule high-priority tasks in the morning",
            "Include breaks between tasks",
            "Allocate buffer time for unexpected work"
        ]
    }
