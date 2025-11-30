import uuid
from pathlib import Path
from typing import Optional

from django.conf import settings
from django.http import HttpRequest


def save_uploaded_file(file_obj, subdir: str) -> str:
    """Persist an uploaded file under MEDIA_ROOT/subdir and return the relative path."""
    if not file_obj:
        raise ValueError('File object is required')

    normalized_subdir = subdir.strip('/').replace('..', '') or 'uploads'
    destination_dir = Path(settings.MEDIA_ROOT) / normalized_subdir
    destination_dir.mkdir(parents=True, exist_ok=True)

    extension = Path(file_obj.name).suffix
    filename = f"{uuid.uuid4().hex}{extension}"
    destination_path = destination_dir / filename

    with destination_path.open('wb+') as destination:
        for chunk in file_obj.chunks():
            destination.write(chunk)

    return f"{normalized_subdir}/{filename}"


def build_public_url(relative_path: Optional[str], request: Optional[HttpRequest] = None) -> Optional[str]:
    """Turn a stored relative path into an absolute (or MEDIA_URL) link for clients."""
    if not relative_path:
        return None

    relative = relative_path.lstrip('/')
    public_path = f"{settings.MEDIA_URL.rstrip('/')}/{relative}" if settings.MEDIA_URL else relative

    if request:
        return request.build_absolute_uri(public_path)
    return public_path
