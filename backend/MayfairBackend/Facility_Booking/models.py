from django.db import models

class Facility(models.Model):
    FACILITY_TYPES = [ 
        ('squash', 'Squash Court'),
        ('gym', 'Gym'),
        ('pool', 'Swimming Pool'),
        ('partyroom', 'Party Room'),
        ('tenniscourt', 'Tennis Court'),
        ('basketballcourt', 'Basketball Court')
    ]
    name = models.CharField(max_length=100,blank=True,default='')
    type = models.CharField(max_length=100,choices=FACILITY_TYPES)
    description = models.TextField(max_length=1000)
    maxOccupancy = models.IntegerField(default=10)

    def __str__(self):
        return f"{self.name} ({self.type})"
    
class FacilityImage(models.Model):
    image = models.ImageField(upload_to="facility_images/")
    caption = models.CharField(max_length=250, blank=True, null=True )
    facility = models.ForeignKey(Facility, related_name='images', on_delete=models.CASCADE) #on_delete, if Facility gets deleted so will this (merges it)

    def __str__(self):
        return f"Image for  {self.facility.name} - {self.caption or 'No Caption'}"