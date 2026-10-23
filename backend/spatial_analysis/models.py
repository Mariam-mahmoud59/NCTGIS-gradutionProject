from django.contrib.gis.db import models


class DesertificationZone(models.Model):
    """
    Represents a monitored desertification zone in the Toshka region.
    Each record stores the geographic boundary, NDVI vegetation index,
    and the date the measurement was recorded from satellite imagery.
    """

    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('moderate', 'Moderate'),
        ('high', 'High'),
        ('severe', 'Severe'),
    ]

    name = models.CharField(
        max_length=255,
        help_text="Name or identifier of the zone (e.g. 'Toshka Sector 1').",
    )
    geom = models.MultiPolygonField(
        srid=4326,
        help_text="Geographic boundary of the zone (WGS 84).",
    )
    ndvi_value = models.FloatField(
        help_text="Normalized Difference Vegetation Index (-1.0 to 1.0).",
    )
    severity = models.CharField(
        max_length=10,
        choices=SEVERITY_CHOICES,
        blank=True,
        help_text="Desertification severity level (auto-derived from NDVI).",
    )
    date_recorded = models.DateField(
        help_text="Date the satellite measurement was captured.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_recorded']
        verbose_name = 'Desertification Zone'
        verbose_name_plural = 'Desertification Zones'

    def __str__(self):
        return f"{self.name} — NDVI {self.ndvi_value} ({self.date_recorded})"

    def save(self, *args, **kwargs):
        """Auto-classify severity from NDVI before saving."""
        if self.ndvi_value is not None:
            if self.ndvi_value < 0.1:
                self.severity = 'severe'
            elif self.ndvi_value < 0.2:
                self.severity = 'high'
            elif self.ndvi_value < 0.3:
                self.severity = 'moderate'
            else:
                self.severity = 'low'
        super().save(*args, **kwargs)
