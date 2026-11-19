"""
System Monitor: Hardware and OS metrics probe (CPU, Memory, Disk, Network).
"""
import time
import psutil

class SystemMonitor:
    def collect(self) -> dict:
        cpu_percent = psutil.cpu_percent(interval=0.1)
        virtual_mem = psutil.virtual_memory()
        disk = psutil.disk_usage('/')

        return {
            "timestamp": time.time(),
            "cpu_percent": cpu_percent,
            "memory_percent": virtual_mem.percent,
            "memory_used_mb": round(virtual_mem.used / (1024 * 1024), 2),
            "memory_total_mb": round(virtual_mem.total / (1024 * 1024), 2),
            "disk_percent": disk.percent,
            "disk_free_gb": round(disk.free / (1024 * 1024 * 1024), 2)
        }
