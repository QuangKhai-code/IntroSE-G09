from django.db import models
from django.core.exceptions import ValidationError


class Round(models.Model):
    """Vòng đấu trong giải"""
    number = models.PositiveIntegerField(verbose_name="Số vòng đấu")
    start_date = models.DateField(verbose_name="Ngày bắt đầu vòng đấu")
    end_date = models.DateField(verbose_name="Ngày kết thúc vòng đấu")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['number']

    def __str__(self):
        return f"Vòng {self.number}"

    def clean(self):
        if self.start_date > self.end_date:
            raise ValidationError(
                "Ngày bắt đầu phải trước ngày kết thúc vòng đấu")
